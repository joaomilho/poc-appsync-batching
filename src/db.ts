type Post = {
  id: string;
  title: string;
  content: string;
  comments: Comment[];
};

type Comment = {
  id: string;
  comment: string;
  postId: string;
};

export const postDb: Post[] = [...Array(100).keys()].map((id) => {
  return {
    id: id.toString(),
    title: `Hello ${id}`,
    content: `Hello world ${id}`,
    comments: [],
  };
});

export const commentDb: Record<string, Comment[]> = {
  "1": [
    { id: "1.1", comment: "Comment 1.1", postId: "1" },
    { id: "1.2", comment: "Comment 1.2", postId: "1" },
    { id: "1.3", comment: "Comment 1.3", postId: "1" },
  ],
  "2": [{ id: "2.1", comment: "Comment 2.1", postId: "2" }],
  "3": [],
};
