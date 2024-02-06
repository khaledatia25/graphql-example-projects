import { GraphQLError } from "graphql";
import {
  getJob,
  getJobsByCompanyId,
  getJobs,
  createJob,
  deleteJob,
  updateJob,
  countJobs,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
import { getUser } from "./db/users.js";
export const resolvers = {
  Query: {
    job: async (_root, args) => {
      const job = await getJob(args.id);
      if (!job) {
        throw notFoundError("No Job Found with id " + args.id);
      }
      return job;
    },
    company: async (_root, args) => {
      const company = await getCompany(args.id);
      if (!company) {
        throw notFoundError("No Company Found with id " + args.id);
      }
      return company;
    },
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount };
    },
  },
  Job: {
    company: (job, _arg, { companyLoader }) =>
      companyLoader.load(job.companyId),
    date: (job) => toISODate(job.createdAt),
  },
  Company: {
    jobs: (company) => getJobsByCompanyId(company.id),
  },
  Mutation: {
    createJob: async (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      return createJob({ title, description, companyId: user.companyId });
    },
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError(`Unauthorized deletion`);
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError(`No Job Found with id ${id}`);
      }
      return job;
    },
    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Unauthorized");
      }
      const job = await updateJob({ title, description, id }, user.companyId);
      if (!job) {
        throw notFoundError("No Job found with id " + id);
      }
      return job;
    },
  },
};
function toISODate(date) {
  return date.slice(0, "yyyy-mm-dd".length);
}

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}
