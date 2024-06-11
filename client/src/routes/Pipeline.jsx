import { useResource } from "@civet/core";
import { faAngleLeft, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useAutoUpdate } from "../Civet";
import PipelineDescription from "../PipelineDescription";
import PipelineEnv from "../PipelineEnv";
import PipelineLogs from "../PipelineLogs";
import PipelineSummary from "../PipelineSummary";
import { Button } from "../styles";

const PipelinePage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  max-width: 50rem;
  margin: 2rem auto;
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

function getPipelines(data) {
  return data ? [data] : [];
}

function Pipeline() {
  const navigate = useNavigate();

  const { workerGroup, pipelineID } = useParams();

  const {
    data: [pipeline],
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: `pipelines/${encodeURIComponent(workerGroup)}/${encodeURIComponent(
      pipelineID,
    )}`,
    options: { getItems: getPipelines },
  });

  useAutoUpdate(notify, 2000);

  const goBack = React.useCallback(() => {
    navigate(`/workergroups/${encodeURIComponent(workerGroup)}`);
  }, [navigate, workerGroup]);

  const [scrollBottom, setScrollBottom] = React.useState(false);

  const handleScroll = React.useCallback((event) => {
    setScrollBottom(
      event.target.scrollTop >=
        event.target.scrollHeight - event.target.offsetHeight,
    );
  }, []);

  const scrollRef = React.useRef();
  const [scrollID, requestScroll] = React.useReducer(
    (lastID) => (lastID + 1) % 10,
    0,
  );

  React.useEffect(() => {
    const onResize = () => {
      if (!scrollBottom) return;
      requestScroll();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scrollBottom]);

  React.useEffect(() => {
    if (scrollBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollBottom, scrollID]);

  const handleScrollDown = React.useCallback(() => {
    if (scrollRef.current == null) return;
    requestScroll();
    setScrollBottom(true);
  }, []);

  return (
    <PipelinePage ref={scrollRef} onScroll={handleScroll}>
      {pipeline ? (
        <PageContent>
          <Button onClick={goBack}>
            <FontAwesomeIcon icon={faAngleLeft} /> Go back
          </Button>

          <PipelineSummary pipeline={pipeline} />

          <PipelineDescription pipeline={pipeline} />

          <PipelineEnv pipeline={pipeline} />

          {["running", "success", "failed", "timeout"].includes(
            pipeline.status,
          ) ? (
            <PipelineLogs
              pipeline={pipeline}
              href={`/pipelines/${encodeURIComponent(
                workerGroup,
              )}/${encodeURIComponent(pipelineID)}/logs`}
              requestScroll={scrollBottom ? requestScroll : undefined}
            />
          ) : null}

          {scrollBottom ? null : (
            <ScrollBottomButton onClick={handleScrollDown}>
              <FontAwesomeIcon icon={faArrowDown} fixedWidth />
            </ScrollBottomButton>
          )}

          <Button onClick={goBack}>
            <FontAwesomeIcon icon={faAngleLeft} /> Go back
          </Button>
        </PageContent>
      ) : (
        <StatusMessage>
          <i>
            {error
              ? `Error loading pipeline: ${error.statusText || error.message}`
              : isLoading && isInitial
                ? "Loading..."
                : "Pipeline not found"}
          </i>
        </StatusMessage>
      )}
    </PipelinePage>
  );
}

export default Pipeline;
