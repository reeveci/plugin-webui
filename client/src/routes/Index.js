import styled from "styled-components";

const IndexPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.p`
  margin: 2rem auto;
  padding: 2rem 4rem;
  text-align: center;
  color: #818181;

  a {
    color: inherit;
  }

  a:hover {
    color: #121212;

    @media (prefers-color-scheme: dark) {
      color: #ededed;
    }
  }

  ::before {
    display: block;
    margin-bottom: 0.5rem;
    content: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 800 800' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3Cg transform='matrix(1,0,0,0.782564,-140,-49.3885)'%3E%3Cg id='Ebene1'%3E%3Cg transform='matrix(1,0,0,1.12612,0,-132.847)'%3E%3Cpath d='M540,1053.36L478,746.308C489.941,674.032 490.876,413.887 508.591,313.27C508.591,313.27 486.822,278.166 474.42,242.559C492.185,229.735 509.681,216.565 524.737,202.982L555.263,202.982C570.319,216.565 587.815,229.735 605.58,242.559C593.178,278.166 571.409,313.27 571.409,313.27C589.124,413.887 590.059,674.032 602,746.308L540,1053.36Z' style='fill:rgb(227,227,227);'/%3E%3C/g%3E%3Cg transform='matrix(-1,0,0,1,1080,-1.42109e-14)'%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L194,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(227,227,227);'/%3E%3C/g%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L193.987,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(227,227,227);'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");

    @media (prefers-color-scheme: dark) {
      content: url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 800 800' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xml:space='preserve' xmlns:serif='http://www.serif.com/' style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3E%3Cg transform='matrix(1,0,0,0.782564,-140,-49.3885)'%3E%3Cg id='Ebene1'%3E%3Cg transform='matrix(1,0,0,1.12612,0,-132.847)'%3E%3Cpath d='M540,1053.36L478,746.308C489.941,674.032 490.876,413.887 508.591,313.27C508.591,313.27 486.822,278.166 474.42,242.559C492.185,229.735 509.681,216.565 524.737,202.982L555.263,202.982C570.319,216.565 587.815,229.735 605.58,242.559C593.178,278.166 571.409,313.27 571.409,313.27C589.124,413.887 590.059,674.032 602,746.308L540,1053.36Z' style='fill:rgb(92,92,92);'/%3E%3C/g%3E%3Cg transform='matrix(-1,0,0,1,1080,-1.42109e-14)'%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L194,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(92,92,92);'/%3E%3C/g%3E%3Cpath d='M353.602,95.142L173,180.673L255,242.01L193.987,293.124L540,1053.36C522.985,698.155 380.248,493.97 353.602,95.142Z' style='fill:rgb(92,92,92);'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
    }
  }
`;

function Index() {
  return (
    <IndexPage>
      <PageContent>
        Welcome to Reeve!
        <br />
        Check out{" "}
        <a href="https://github.com/reeveci/reeve#reeve-ci--cd">the docs</a>.
      </PageContent>
    </IndexPage>
  );
}

export default Index;
