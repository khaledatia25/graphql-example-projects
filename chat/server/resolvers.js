import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { createMessage, getMessages } from "./db/messages.js";

const pubSub = new PubSub();

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      const msg = await createMessage(user, text);
      pubSub.publish("MSG_ADDED", { messageAdded: msg });
      return msg;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: (_root, _args, { user }) => {
        if (!user) throw unauthorizedError();
        return pubSub.asyncIterator("MSG_ADDED");
      },
    },
  },
};

function unauthorizedError() {
  return new GraphQLError("Not authenticated", {
    extensions: { code: "UNAUTHORIZED" },
  });
}
