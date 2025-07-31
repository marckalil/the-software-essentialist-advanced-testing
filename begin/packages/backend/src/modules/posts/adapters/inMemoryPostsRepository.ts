import { Post } from "@dddforum/shared/src/api/posts";
import { Spy } from "../../../shared/testDoubles/spy";
import { PostsRepository } from "../ports/postsRepository";

export class InMemoryPostsRepositorySpy
  extends Spy<PostsRepository>
  implements PostsRepository
{
  private posts: Post[] = [];
  async findPosts(sort: string): Promise<Post[]> {
    this.addCall("findPosts", [sort]);

    if (sort === "asc")
      return this.posts.sort((a, b) =>
        a.dateCreated.localeCompare(b.dateCreated),
      );
    if (sort === "desc")
      return this.posts.sort((a, b) =>
        b.dateCreated.localeCompare(a.dateCreated),
      );
    return Promise.resolve(this.posts);
  }

  public reset() {
    this.posts = [];
    this.resetSpiedCalls();
  }
}
