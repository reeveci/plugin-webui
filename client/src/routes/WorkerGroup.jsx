import { useResource } from '@civet/core';
import { useParams } from 'react-router';
import styled from 'styled-components';
import PipelineSummary from '@/PipelineSummary';
import useAutoUpdate from '@/useAutoUpdate';

const WorkerGroupPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  margin: 0px auto;
  padding: 2rem 4rem;

  @media (max-width: 767.9px) {
    padding: 1rem 2rem;
  }
`;

const StatusMessage = styled.p`
  margin: 2rem auto;
  padding: 2rem 4rem;
  text-align: center;
`;

function getPipelines(data) {
  return data?.pipelines || [];
}

function WorkerGroup() {
  const { workerGroup } = useParams();

  const {
    data: pipelines,
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: `pipelines/${encodeURIComponent(workerGroup)}`,
    options: { getItems: getPipelines },
  });

  useAutoUpdate(notify, 2000);

  return (
    <WorkerGroupPage>
      {pipelines.length > 0 ? (
        <PageContent>
          {pipelines.map((pipeline) => (
            <PipelineSummary
              key={pipeline.id}
              pipeline={pipeline}
              href={`/workergroups/${encodeURIComponent(
                workerGroup,
              )}/pipelines/${encodeURIComponent(pipeline.id)}`}
            />
          ))}
        </PageContent>
      ) : (
        <StatusMessage>
          <i>
            {error
              ? `Error loading pipelines: ${error.statusText || error.message}`
              : isLoading && isInitial
                ? 'Loading...'
                : 'Queue is empty'}
          </i>
        </StatusMessage>
      )}
    </WorkerGroupPage>
  );
}

export default WorkerGroup;
