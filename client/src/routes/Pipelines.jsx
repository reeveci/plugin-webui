import { useResource } from '@civet/core';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import styled from 'styled-components';
import PipelineSummary from '@/PipelineSummary';
import { Button } from '@/styles';
import useAutoUpdate from '@/useAutoUpdate';

const PipelinesPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  margin: 1rem auto;
  padding: 2rem 4rem;

  @media (max-width: 767.9px) {
    padding: 1rem 2rem;
  }
`;

const StatusMessage = styled.p`
  margin: 1rem auto;
  padding: 2rem 0;
  text-align: center;
`;

const Blur = styled.div`
  z-index: 1;
  ${({ $position }) => $position ?? 'top'}: 0;
  background-color: #ffffffb2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  height: 1rem;
  ${({ $position }) => `margin-${$position ?? 'top'}`}: -1rem;

  @media (prefers-color-scheme: dark) {
    background-color: #161616b2;
  }

  @media (min-height: 512px) {
    position: sticky;
  }
`;

const FilterSection = styled.div`
  z-index: 2;
  top: 1rem;
  background-color: #f7f7f7b2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 1rem -0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow-x: auto;
  gap: 0.75rem;

  @media (prefers-color-scheme: dark) {
    background-color: #232323b2;
    border-bottom-color: #5c5c5c;
  }

  @media (min-height: 512px) {
    position: sticky;
  }
`;

const Filter = styled(Button)`
  text-transform: capitalize;
  white-space: nowrap;

  &.active {
    background-color: hsl(224, 98%, 58%);
    color: white;
  }
`;

function getWorkerGroups(data) {
  return data?.workerGroups ?? [];
}

function getPipelines(data) {
  return data?.pipelines ?? [];
}

function Pipelines() {
  const [searchParams, setSearchParams] = useSearchParams();
  const enabledWorkerGroups = searchParams.getAll('g');
  const setEnabledWorkerGroups = useCallback(
    (value) => {
      setSearchParams((searchParams) => {
        searchParams.delete('g');
        value?.forEach((entry) => {
          searchParams.append('g', entry);
        });
        return searchParams;
      });
    },
    [setSearchParams],
  );
  const setWorkerGroupEnabled = useCallback(
    (group, enabled) => {
      if (!group) return;
      if (enabled) {
        setEnabledWorkerGroups([...new Set([...enabledWorkerGroups, group])]);
      } else {
        setEnabledWorkerGroups(
          enabledWorkerGroups.filter((entry) => entry !== group),
        );
      }
    },
    [setEnabledWorkerGroups, enabledWorkerGroups],
  );

  const { data: workerGroups, notify: notifyWorkerGroups } = useResource({
    name: 'workerGroups',
    options: { getItems: getWorkerGroups },
    persistent: true,
  });

  useAutoUpdate(notifyWorkerGroups, 2000);

  const {
    data: pipelines,
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: 'pipelines',
    options: {
      searchParams: { workerGroup: enabledWorkerGroups },
      getItems: getPipelines,
    },
  });

  useAutoUpdate(notify, 2000);

  const hasFilters = workerGroups.length > 0;

  return (
    <PipelinesPage>
      {hasFilters ? <Blur $position="top" /> : null}

      <PageContent>
        {hasFilters ? (
          <FilterSection>
            {workerGroups.map((workerGroup) => {
              const enabled = enabledWorkerGroups.includes(workerGroup);

              return (
                <Filter
                  key={workerGroup}
                  className={enabled ? 'active' : undefined}
                  onClick={() => {
                    setWorkerGroupEnabled(workerGroup, !enabled);
                  }}
                >
                  <FontAwesomeIcon icon={faLayerGroup} /> {workerGroup}
                </Filter>
              );
            })}
          </FilterSection>
        ) : null}

        {pipelines.length > 0 ? (
          <>
            {pipelines.map((pipeline) => (
              <PipelineSummary
                key={pipeline.id}
                pipeline={pipeline}
                href={`/pipelines/${encodeURIComponent(pipeline.id)}`}
              />
            ))}
          </>
        ) : (
          <StatusMessage>
            <i>
              {error
                ? `Error loading pipelines: ${error.statusText || error.message}`
                : isLoading && isInitial
                  ? 'Loading...'
                  : 'No pipelines found'}
            </i>
          </StatusMessage>
        )}
      </PageContent>
    </PipelinesPage>
  );
}

export default Pipelines;
