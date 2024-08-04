import { FragmentReference, Variables } from '../core/FragmentReference';
import { useIsographEnvironment } from './IsographEnvironmentProvider';
import { ROOT_ID } from '../core/IsographEnvironment';
import { IsographEntrypoint } from '../core/entrypoint';
import { getOrCreateCacheForArtifact } from '../core/cache';
import { useLazyDisposableState } from '@isograph/react-disposable-state';
import { type NetworkRequestReference } from '../core/NetworkRequestReference';

export function useLazyReference<
  TReadFromStore extends Object,
  TClientFieldValue,
>(
  entrypoint: IsographEntrypoint<TReadFromStore, TClientFieldValue>,
  variables: Variables,
): {
  networkRequestReference: NetworkRequestReference;
  fragmentReference: FragmentReference<TReadFromStore, TClientFieldValue>;
} {
  const environment = useIsographEnvironment();
  const cache = getOrCreateCacheForArtifact(environment, entrypoint, variables);

  // TODO add comment explaining why we never use this value
  // @ts-ignore(6133)
  const wrapper = useLazyDisposableState(cache).state;

  return {
    networkRequestReference: {
      kind: 'NetworkRequestReference',
      promise: wrapper,
    },
    fragmentReference: {
      kind: 'FragmentReference',
      readerArtifact: entrypoint.readerArtifact,
      root: ROOT_ID,
      variables,
      nestedRefetchQueries: entrypoint.nestedRefetchQueries,
    },
  };
}
