import { handleError, ok, parseId } from "@/lib/api/respond";
import { getCompraDetalle } from "@/lib/services/compra";

export async function GET(request, context) {
  let id;
  try {
    id = parseId((await context.params).id);
    return ok(await getCompraDetalle(id));
  } catch (error) {
    return handleError(error, { label: "compra", id });
  }
}
