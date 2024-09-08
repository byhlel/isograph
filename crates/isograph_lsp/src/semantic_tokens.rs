use std::ops::Range;

use crate::{
    lsp_runtime_error::LSPRuntimeResult,
    lsp_state::LSPState,
    row_col_offset::{diff_to_end_of_slice, get_index_from_diff, ColOffset, RowColDiff},
};
use common_lang_types::{Span, TextSource, WithSpan};
use intern::string_key::Intern;
use isograph_compiler::{extract_iso_literals_from_file_content, IsoLiteralExtraction};
use isograph_lang_parser::{parse_iso_literal, IsoLiteralExtractionResult};
use isograph_lang_types::{
    ClientFieldDeclarationWithUnvalidatedDirectives, EntrypointTypeAndField,
};
use lsp_types::{
    request::{Request, SemanticTokensFullRequest},
    SemanticToken, SemanticTokens, SemanticTokensParams, SemanticTokensResult,
};

pub fn on_semantic_token_full_request(
    state: &mut LSPState,
    params: <SemanticTokensFullRequest as Request>::Params,
) -> LSPRuntimeResult<<SemanticTokensFullRequest as Request>::Result> {
    let SemanticTokensParams {
        text_document,
        work_done_progress_params: _,
        partial_result_params: _,
    } = params;

    let file_text = state.text_for(&text_document.uri).expect(
        format!(
            "Retrieving semantic tokens for document not opened before {}",
            text_document.uri
        )
        .as_str(),
    );
    let literal_extractions = extract_iso_literals_from_file_content(file_text);
    let mut semantic_tokens = vec![];

    // SemanticTokens are all relative to the start of the previous one, so we have to
    // keep track of the start of the last token that we have pushed onto
    // semantic_tokens
    let mut index_of_last_token = 0;

    // N.B. we are relying on the literal extractions being in order on the page.
    for literal_extraction in literal_extractions {
        let IsoLiteralExtraction {
            iso_literal_text,
            iso_literal_start_index,
            const_export_name,
            ..
        } = literal_extraction;

        let initial_diff =
            diff_to_end_of_slice(&file_text[index_of_last_token..iso_literal_start_index]);

        let file_path = text_document.uri.path().intern();
        let text_source = TextSource {
            path: file_path.into(),
            span: Some(Span::new(
                iso_literal_start_index as u32,
                (iso_literal_start_index + iso_literal_text.len()) as u32,
            )),
        };
        let iso_literal_extraction_result = parse_iso_literal(
            iso_literal_text,
            file_path.into(),
            const_export_name,
            text_source,
        );
        if let Ok(iso_literal_extraction_result) = iso_literal_extraction_result {
            eprintln!(
                "\ngetting diff from {:?}\n\n",
                &file_text[index_of_last_token..iso_literal_start_index]
            );
            // eprintln!(
            //     "\n{:?}",
            //     &file_text[(iso_literal_start_index - 5)..(iso_literal_start_index + 10)]
            // );

            let (new_tokens, total_diff) = iso_literal_parse_result_to_tokens(
                iso_literal_extraction_result,
                iso_literal_text,
                initial_diff,
            );
            semantic_tokens.extend(new_tokens);
            let new_index = get_index_from_diff(
                &file_text[index_of_last_token..iso_literal_start_index],
                total_diff,
            );
            eprintln!("total diff {:?}\nnew index {new_index}\n", total_diff);
            index_of_last_token = new_index + index_of_last_token;
        }
    }
    let result = SemanticTokensResult::Tokens(SemanticTokens {
        data: semantic_tokens,
        result_id: None,
    });
    Ok(Some(result))
}

fn iso_literal_parse_result_to_tokens(
    iso_literal_extraction_result: IsoLiteralExtractionResult,
    iso_literal_text: &str,
    initial_diff: RowColDiff,
) -> (Vec<SemanticToken>, RowColDiff) {
    match iso_literal_extraction_result {
        IsoLiteralExtractionResult::ClientFieldDeclaration(client_field_declaration) => {
            client_field_declaration_to_tokens(
                client_field_declaration,
                iso_literal_text,
                initial_diff,
            )
        }
        IsoLiteralExtractionResult::EntrypointDeclaration(entrypoint_declaration) => {
            entrypoint_declaration_to_tokens(entrypoint_declaration, iso_literal_text, initial_diff)
        }
    }
}

fn client_field_declaration_to_tokens(
    client_field_declaration: WithSpan<ClientFieldDeclarationWithUnvalidatedDirectives>,
    iso_literal_text: &str,
    initial_diff: RowColDiff,
) -> (Vec<SemanticToken>, RowColDiff) {
    eprintln!("\nclient field diff {initial_diff:?}");
    let mut semantic_token_generator = SemanticTokenGenerator::new(iso_literal_text, initial_diff);
    semantic_token_generator
        .generate_semantic_token(client_field_declaration.item.parent_type.span, 3);
    semantic_token_generator
        .generate_semantic_token(client_field_declaration.item.client_field_name.span, 4);
    eprintln!("\nclient field tokens {semantic_token_generator:#?}");
    semantic_token_generator.consume()
}

fn entrypoint_declaration_to_tokens(
    entrypoint_declaration: WithSpan<EntrypointTypeAndField>,
    iso_literal_text: &str,
    initial_diff: RowColDiff,
) -> (Vec<SemanticToken>, RowColDiff) {
    eprintln!("\nentrypoint initial diff {initial_diff:?}");
    let mut semantic_token_generator = SemanticTokenGenerator::new(iso_literal_text, initial_diff);
    semantic_token_generator
        .generate_semantic_token(entrypoint_declaration.item.parent_type.span, 3);
    semantic_token_generator
        .generate_semantic_token(entrypoint_declaration.item.client_field_name.span, 4);
    eprintln!("\nentrypoint tokens {semantic_token_generator:#?}");
    semantic_token_generator.consume()
}

#[derive(Debug)]
enum SemanticTokenGeneratorState {
    InitialDiff(RowColDiff),
    LastSpan(Span),
}

#[derive(Debug)]
struct SemanticTokenGenerator<'a> {
    state: SemanticTokenGeneratorState,
    text: &'a str,
    tokens: Vec<SemanticToken>,
    final_diff: RowColDiff,
}

impl<'a> SemanticTokenGenerator<'a> {
    fn generate_semantic_token(&mut self, span: Span, token_type: u32) {
        let token = match self.state {
            SemanticTokenGeneratorState::InitialDiff(initial_diff) => {
                let diff =
                    initial_diff + diff_to_end_of_slice(&self.text[0..(span.start as usize)]);
                self.state = SemanticTokenGeneratorState::LastSpan(span);
                self.final_diff = self.final_diff + diff;
                SemanticToken {
                    delta_line: diff.delta_line(),
                    delta_start: diff.delta_start(),
                    length: span.len(),
                    token_type,
                    token_modifiers_bitset: 0,
                }
            }
            SemanticTokenGeneratorState::LastSpan(last_span) => {
                let diff = diff_to_end_of_slice(
                    &self.text[(last_span.start as usize)..(span.start as usize)],
                );
                self.final_diff = self.final_diff + diff;
                self.state = SemanticTokenGeneratorState::LastSpan(span);
                SemanticToken {
                    delta_line: diff.delta_line(),
                    delta_start: diff.delta_start(),
                    length: span.len(),
                    token_type,
                    token_modifiers_bitset: 0,
                }
            }
        };
        self.tokens.push(token);
    }

    fn new(text: &'a str, initial_diff: RowColDiff) -> Self {
        Self {
            state: SemanticTokenGeneratorState::InitialDiff(initial_diff),
            text,
            tokens: vec![],
            final_diff: RowColDiff::default(),
        }
    }

    fn consume(self) -> (Vec<SemanticToken>, RowColDiff) {
        (self.tokens, self.final_diff)
    }
}
