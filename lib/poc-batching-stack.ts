import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import * as fs from "fs";
import * as path from "path";
import { BaseResolverProps } from "@aws-cdk/aws-appsync-alpha";

export class PocBatchingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const withoutBatching = new PostAPI(scope, "withoutBatching", {
      fnPath: "withoutBatching.ts",
      maxBatchSize: undefined,
    });

    const withBatching = new PostAPI(scope, "withBatching", {
      fnPath: "withBatching.ts",
      maxBatchSize: 10,
    });
  }
}

type PostAPIParams = {
  fnPath: string;
  maxBatchSize: BaseResolverProps["maxBatchSize"];
};

class PostAPI extends Stack {
  api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, params: PostAPIParams) {
    super(scope, id);

    this.api = new appsync.GraphqlApi(this, `Api`, {
      name: `${id}-api`,
      schema: appsync.Schema.fromAsset(fromSrc("schema.graphql")),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    const getPost = new node.NodejsFunction(this, "GetPostFn", {
      entry: fromSrc(params.fnPath),
      handler: "getPost",
    });

    const getPostDS = this.api.addLambdaDataSource("getPostDS", getPost);

    getPostDS.createResolver({
      typeName: "Query",
      fieldName: "getPost",
    });

    const listPosts = new node.NodejsFunction(this, "ListPostFn", {
      entry: fromSrc(params.fnPath),
      handler: "listPosts",
    });

    const listPostsDS = this.api.addLambdaDataSource("listPostsDS", listPosts);

    listPostsDS.createResolver({
      typeName: "Query",
      fieldName: "listPosts",
    });

    const getComments = new node.NodejsFunction(this, "GetCommentsFn", {
      entry: fromSrc(params.fnPath),
      handler: "getComments",
    });

    const getCommentsDS = this.api.addLambdaDataSource(
      "getCommentsDS",
      getComments
    );

    getCommentsDS.createResolver({
      typeName: "Post",
      fieldName: "comments",
      maxBatchSize: params.maxBatchSize,
    });

    new CfnOutput(this, "output-api-key", {
      value: this.api.apiKey!,
    });
  }
}

function fromSrc(file: string) {
  return path.join(__dirname, "../src/", file);
}
