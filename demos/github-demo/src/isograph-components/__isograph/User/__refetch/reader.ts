import type {ReaderArtifact, ReaderAst, ExtractSecondParam} from '@isograph/react';
import { makeNetworkRequest, type IsographEnvironment, type IsographEntrypoint } from '@isograph/react';
const resolver = (
  environment: IsographEnvironment,
  artifact: IsographEntrypoint<any, any>,
  variables: any
) => () => makeNetworkRequest(environment, artifact, variables);

// the type, when read out (either via useLazyReference or via graph)
export type User____refetch__outputType = () => void;

const readerAst: ReaderAst<User____refetch__param> = [
  {
    kind: "Scalar",
    fieldName: "id",
    alias: null,
    arguments: null,
  },
];

export type User____refetch__param = {
  id: string,
};

const artifact: ReaderArtifact<
  User____refetch__param,
  User____refetch__outputType
> = {
  kind: "ReaderArtifact",
  resolver: resolver as any,
  readerAst,
  variant: { kind: "Eager" },
};

export default artifact;
