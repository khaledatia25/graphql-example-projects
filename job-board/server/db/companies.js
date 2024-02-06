import Dataloader from "dataloader";
import { connection } from "./connection.js";

const getCompanyTable = () => connection.table("company");

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

export function createCompnayLoader() {
  return new Dataloader(async (ids) => {
    const compnaies = await getCompanyTable().select().whereIn("id", ids);
    return ids.map((id) => compnaies.find((c) => c.id === id));
  });
}
