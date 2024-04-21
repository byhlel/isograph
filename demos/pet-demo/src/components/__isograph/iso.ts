import type {IsographEntrypoint} from '@isograph/react';
import { Checkin__CheckinDisplay__param } from './Checkin/CheckinDisplay/param_type';
import { Pet__FavoritePhraseLoader__param } from './Pet/FavoritePhraseLoader/param_type';
import { Pet__PetBestFriendCard__param } from './Pet/PetBestFriendCard/param_type';
import { Pet__PetCheckinsCard__param } from './Pet/PetCheckinsCard/param_type';
import { Pet__PetPhraseCard__param } from './Pet/PetPhraseCard/param_type';
import { Pet__PetStatsCard__param } from './Pet/PetStatsCard/param_type';
import { Pet__PetSummaryCard__param } from './Pet/PetSummaryCard/param_type';
import { Pet__PetTaglineCard__param } from './Pet/PetTaglineCard/param_type';
import { Pet__PetUpdater__param } from './Pet/PetUpdater/param_type';
import { Pet__petSuperName__param } from './Pet/petSuperName/param_type';
import { Query__HomeRoute__param } from './Query/HomeRoute/param_type';
import { Query__PetDetailRoute__param } from './Query/PetDetailRoute/param_type';
import { Query__PetFavoritePhrase__param } from './Query/PetFavoritePhrase/param_type';
import entrypoint_Query__HomeRoute from '../__isograph/Query/HomeRoute/entrypoint';
import entrypoint_Query__PetDetailRoute from '../__isograph/Query/PetDetailRoute/entrypoint';
import entrypoint_Query__PetFavoritePhrase from '../__isograph/Query/PetFavoritePhrase/entrypoint';

// This is the type given to regular client fields.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes one parameter
// of type TParam.
type IdentityWithParam<TParam> = <TClientFieldReturn>(
  x: (param: TParam) => TClientFieldReturn
) => (param: TParam) => TClientFieldReturn;

// This is the type given it to client fields with @component.
// This means that the type of the exported iso literal is exactly
// the type of the passed-in function, which takes two parameters.
// The first has type TParam, and the second has type TAdditionalProps.
//
// TAdditionalProps becomes the types of the props you must pass
// whenever the @component field is rendered.
type IdentityWithParamComponent<TParam> = <TClientFieldReturn, TAdditionalProps = Record<string, never>>(
  x: (data: TParam, secondParam: TAdditionalProps) => TClientFieldReturn
) => (data: TParam, secondParam: TAdditionalProps) => TClientFieldReturn;

type WhitespaceCharacter = ' ' | '\t' | '\n';
type Whitespace<In> = In extends `${WhitespaceCharacter}${infer In}`
  ? Whitespace<In>
  : In;

// This is a recursive TypeScript type that matches strings that
// start with whitespace, followed by TString. So e.g. if we have
// ```
// export function iso<T>(
//   param: T & MatchesWhitespaceAndString<'field Query.foo', T>
// ): Bar;
// ```
// then, when you call
// ```
// const x = iso(`
//   field Query.foo ...
// `);
// ```
// then the type of `x` will be `Bar`, both in VSCode and when running
// tsc. This is how we achieve type safety — you can only use fields
// that you have explicitly selected.
type MatchesWhitespaceAndString<
  TString extends string,
  T
> = Whitespace<T> extends `${TString}${string}` ? T : never;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Checkin.CheckinDisplay', T>
): IdentityWithParamComponent<Checkin__CheckinDisplay__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.FavoritePhraseLoader', T>
): IdentityWithParamComponent<Pet__FavoritePhraseLoader__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetBestFriendCard', T>
): IdentityWithParamComponent<Pet__PetBestFriendCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetCheckinsCard', T>
): IdentityWithParamComponent<Pet__PetCheckinsCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetPhraseCard', T>
): IdentityWithParamComponent<Pet__PetPhraseCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetStatsCard', T>
): IdentityWithParamComponent<Pet__PetStatsCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetSummaryCard', T>
): IdentityWithParamComponent<Pet__PetSummaryCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetTaglineCard', T>
): IdentityWithParamComponent<Pet__PetTaglineCard__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.PetUpdater', T>
): IdentityWithParamComponent<Pet__PetUpdater__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Pet.petSuperName', T>
): IdentityWithParam<Pet__petSuperName__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.HomeRoute', T>
): IdentityWithParamComponent<Query__HomeRoute__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.PetDetailRoute', T>
): IdentityWithParamComponent<Query__PetDetailRoute__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'field Query.PetFavoritePhrase', T>
): IdentityWithParamComponent<Query__PetFavoritePhrase__param>;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.HomeRoute', T>
): typeof entrypoint_Query__HomeRoute;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.PetDetailRoute', T>
): typeof entrypoint_Query__PetDetailRoute;

export function iso<T>(
  param: T & MatchesWhitespaceAndString<'entrypoint Query.PetFavoritePhrase', T>
): typeof entrypoint_Query__PetFavoritePhrase;

export function iso(_isographLiteralText: string):
  | IdentityWithParam<any>
  | IdentityWithParamComponent<any>
  | IsographEntrypoint<any, any>
{
  return function identity<TClientFieldReturn>(
    clientFieldOrEntrypoint: (param: any) => TClientFieldReturn,
  ): (param: any) => TClientFieldReturn {
    return clientFieldOrEntrypoint;
  };
}