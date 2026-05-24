export async function onRequestGet() {
  return new Response(JSON.stringify({
    service: 'nuxt-xlog-website',
    status: 'ok',
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    status: 200,
  })
}
