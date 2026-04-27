
export async function GET() {
  return Response.json({
    nodeApiUrl: process.env.NODE_EXT_API_URL,
    socketUrl: process.env.NODE_SOCKET_URL,
    socketPath: process.env.NODE_SOCKET_PATH,
  });
}