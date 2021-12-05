export async function getStaticProps() {
  let response = await fetch("http://localhost:3333/episodes");
  let data = await response.json();

  return {
    props: {
      data,
    },
  };
}

export default function Home(props) {
  return (
    <>
      <h1>Hello World</h1>
      <h1>{JSON.stringify(props.data)}</h1>
    </>
  );
}
