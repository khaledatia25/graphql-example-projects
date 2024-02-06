async function fetchGreeting() {
  const data = await fetch("http://localhost:4000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `#graphql
        query {
            greeting
        }`,
    }),
  });
  const body = await data.json();
  console.log(body);
  const el = document.querySelector("#message");
  el.innerText = body.data.greeting;
}
fetchGreeting();
