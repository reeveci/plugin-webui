import { useResource } from '@civet/core';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import PipelineDescription from '@/PipelineDescription';
import PipelineEnv from '@/PipelineEnv';
import PipelineLogs from '@/PipelineLogs';
import PipelineSummary from '@/PipelineSummary';
import { Button } from '@/styles';
import useAutoUpdate from '@/useAutoUpdate';

const PipelinePage = styled.div`
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

const ScrollBottomButton = styled(Button)`
  position: fixed;
  right: 4rem;
  bottom: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;

  @media (max-width: 767.9px) {
    right: 2rem;
    bottom: 1rem;
  }
`;

const StatusMessage = styled.p`
  margin: 2rem auto;
  padding: 2rem 4rem;
  text-align: center;
`;

function getPipeline(data) {
  return data ? [data] : [];
}

function Pipeline() {
  const { id } = useParams();

  const {
    data: [pipeline],
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: `pipelines/${encodeURIComponent(id)}`,
    options: { getItems: getPipeline },
  });

  useAutoUpdate(notify, 2000);

  const [scrollBottom, setScrollBottom] = useState(false);

  const handleScroll = useCallback((event) => {
    setScrollBottom(
      event.target.scrollTop >=
        event.target.scrollHeight - event.target.offsetHeight,
    );
  }, []);

  const scrollRef = useRef();
  const [scrollID, requestScroll] = useReducer(
    (lastID) => (lastID + 1) % 10,
    0,
  );

  useEffect(() => {
    const onResize = () => {
      if (!scrollBottom) return;
      requestScroll();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [scrollBottom]);

  useEffect(() => {
    if (scrollBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollBottom, scrollID]);

  const handleScrollDown = useCallback(() => {
    if (scrollRef.current == null) return;
    requestScroll();
    setScrollBottom(true);
  }, []);

  return (
    <PipelinePage ref={scrollRef} onScroll={handleScroll}>
      {pipeline ? (
        <PageContent>
          <PipelineSummary pipeline={pipeline} />

          <PipelineDescription pipeline={pipeline} />

          <PipelineEnv pipeline={pipeline} />

          {['running', 'success', 'failed', 'timeout'].includes(
            pipeline.status,
          ) ? (
            <PipelineLogs
              pipeline={pipeline}
              href={`/pipelines/${encodeURIComponent(id)}/logs`}
              requestScroll={scrollBottom ? requestScroll : undefined}
            />
          ) : null}

          {scrollBottom ? null : (
            <ScrollBottomButton onClick={handleScrollDown}>
              <FontAwesomeIcon icon={faArrowDown} fixedWidth />
            </ScrollBottomButton>
          )}
        </PageContent>
      ) : (
        <StatusMessage>
          <i>
            {error
              ? `Error loading pipeline: ${error.statusText || error.message}`
              : isLoading && isInitial
                ? 'Loading...'
                : 'Pipeline not found'}
          </i>
        </StatusMessage>
      )}
    </PipelinePage>
  );
}

export default Pipeline;
