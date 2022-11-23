import { postDb } from "./db";

export async function getPost(params: any, ctx: any) {
  console.log(params, ctx);
  //   arguments: { id: "2" },
  const id = params.arguments.id;

  return postDb.find((post) => post.id === id);
}

export async function listPosts(params: any, ctx: any) {
  console.log(params, ctx);
  return postDb;
}
