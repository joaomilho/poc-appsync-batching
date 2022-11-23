import { commentDb } from "./db";

export { getPost, listPosts } from "./common";

export async function getComments(params: any, ctx: any) {
  console.log({ params, ctx });
  return commentDb[params.source.id] || [];
}
