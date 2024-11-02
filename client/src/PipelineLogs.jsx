import { useResource } from "@civet/core";
import {
  faAngleDown,
  faAngleRight,
  faRotateRight,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { DEFAULT_STAGE } from "./environment";
import { Button, Status } from "./styles";

const SetupTable = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 1rem auto;
  border-spacing: 0.25rem 0.5rem;
`;

const SetupContent = styled.tbody``;

const SetupHeaderRow = styled.tr``;

const SetupHeader = styled.td`
  padding: 0px;
  font-size: 0.8em;
  font-stretch: semi-condensed;
  text-transform: uppercase;
  color: #3992ff;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledButton = styled(Button)`
  float: right;
`;

const Card = styled.table`
  position: relative;
  color: inherit;
  background-color: white;
  width: 100%;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  line-height: 1.5;
  margin: 2rem auto;

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }

  & + &::before {
    content: "︙";
    color: #818181;
    font-size: 1.25rem;
    position: absolute;
    top: -1rem;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const CardContent = styled.tbody``;

const HeaderRow = styled.tr`
  max-width: 0px;
  position: ${({ $sticky }) => ($sticky ? "sticky" : "inherit")};
  top: -2px;
  margin-bottom: 2px;
`;

const Header = styled.td`
  min-width: 100%;
  max-width: 0px;
  display: inline-flex;
  align-items: center;
  background-color: white;
  border-radius: 5px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  padding: 0.5rem 0.5rem 0.5rem 1rem;

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }
`;

const Name = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  width: 0px;
  font-size: 1rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Controls = styled.div``;

const LogButton = styled(Button)`
  margin-left: 1rem;
`;

const LogsRow = styled.tr``;

const Logs = styled.td`
  max-width: 0px;
  border-radius: 6px;
  overflow: auto;
  box-shadow:
    inset 0 0px 1px hsla(0, 0%, 0%, 0.2),
    inset 0 1px 2px hsla(0, 0%, 0%, 0.2);
  color: white;
  background-color: hsl(224, 38%, 18%);

  ${({ $attached }) =>
    $attached
      ? `
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        `
      : ""}

  pre {
    display: inline-block;
    margin: 0.5rem;
  }

  i {
    color: inherit;
  }
`;

function PipelineLogs({ pipeline, href, requestScroll }) {
  const {
    data: [logs],
    error,
    isLoading,
    notify,
  } = useResource({
    name: href,
    options: { stream: true },
  });

  const reload = useCallback(() => {
    notify();
  }, [notify]);

  useEffect(() => {
    if (!logs || !error || isLoading) {
      return undefined;
    }

    const t = setTimeout(() => notify(), 5000);

    return () => clearTimeout(t);
  }, [logs, error, isLoading, notify]);

  useEffect(() => {
    if (requestScroll) {
      requestScroll();
    }
  }, [requestScroll, logs]);

  const { setup, steps } = useMemo(() => {
    const setup = { log: "" };
    const steps = (pipeline?.pipeline?.steps || []).map((step) => ({
      name: step.name,
      stage: step.stage,
      log: "",
      status: "waiting",
    }));

    /*
      init
      signal
      api

      headline
      description

      prepare

      setup
      setup:>
      setup:success
      setup:failure

      step:n
      step:n:skip
      step:n:>
      step:n:success
      step:n:failure

      success
      failure

      cleanup
    */

    (logs || "").split("\n").forEach((line) => {
      if (line.startsWith("[headline]") || line.startsWith("[description]")) {
        return;
      }

      if (line.startsWith("[step:")) {
        const match = /^\[step:(\d+)(?::([^\]]+))?\]\s+>[ …](.*)$/.exec(line);
        if (match) {
          const [, number, status, message] = match;
          const step = steps[number - 1];
          if (step) {
            if (step.status === "waiting") step.status = pipeline.status;

            if (status) {
              switch (status.replace(/:!$/g, "")) {
                case "skip":
                  step.status = "skip";
                  return;

                case "success":
                  step.status = "success";
                  return;

                case "failure":
                  step.status = "failed";
                  return;

                case ">":
                  step.log += `${message}\n`;
                  return;

                default:
              }
            }
          }
        }
      }

      if (line) {
        setup.log += `${line.replace(/^\[[^\]]+\]\s+>[ …]/, "")}\n`;
      }
    });

    return { setup, steps };
  }, [pipeline, logs]);

  const [setupVisible, setSetupVisible] = useState(false);
  const handleToggleSetupVisible = useCallback(() => {
    setSetupVisible((prev) => !prev);
  }, []);

  return (
    <>
      <SetupTable>
        <SetupContent>
          <SetupHeaderRow>
            <SetupHeader onClick={handleToggleSetupVisible}>
              <FontAwesomeIcon
                icon={setupVisible ? faAngleDown : faAngleRight}
                fixedWidth
              />
              Pipeline log
            </SetupHeader>
          </SetupHeaderRow>

          {setupVisible ? (
            <LogsRow>
              <Logs>
                <pre>{setup.log || <i>No logs available</i>}</pre>
              </Logs>
            </LogsRow>
          ) : null}
        </SetupContent>
      </SetupTable>

      {steps.map((step, i) => (
        <Step key={step.name} {...step} index={i + 1} count={steps.length} />
      ))}

      {isLoading ? null : (
        <StyledButton onClick={reload}>
          <FontAwesomeIcon icon={faRotateRight} /> Reload
        </StyledButton>
      )}
    </>
  );
}

export default PipelineLogs;

function Step({ name, stage, status, log, index, count }) {
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(() =>
    ["running", "failed"].includes(status),
  );
  const handleToggleVisible = useCallback(() => {
    setAuto(false);
    setVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    if (auto) setVisible(["running", "failed"].includes(status));
  }, [auto, status]);

  return (
    <Card>
      <CardContent>
        <HeaderRow $sticky={visible}>
          <Header
            title={
              stage && stage !== DEFAULT_STAGE
                ? `${name} [stage ${stage}] (${index}/${count})`
                : `${name} (${index}/${count})`
            }
          >
            <Name>
              {name}{" "}
              <small>
                <i>
                  {stage && stage !== DEFAULT_STAGE ? <>{stage} </> : null}(
                  {index}/{count})
                </i>
              </small>
            </Name>

            <Controls>
              <Status $status={status}>{status}</Status>

              <LogButton onClick={handleToggleVisible}>
                <FontAwesomeIcon icon={faTerminal} fixedWidth />
              </LogButton>
            </Controls>
          </Header>
        </HeaderRow>

        {visible ? (
          <LogsRow>
            <Logs $attached>
              <pre>{log || <i>No logs available</i>}</pre>
            </Logs>
          </LogsRow>
        ) : null}
      </CardContent>
    </Card>
  );
}
