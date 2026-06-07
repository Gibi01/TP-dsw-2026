import { Router } from "express"
import { sanitizesanatorioInput, findAll,findOne, add,update, remove} from "./sanatorio.controlador.js"

export const sanatorioRouter = Router()


sanatorioRouter.get('/', findAll);
sanatorioRouter.get('/:id', findOne);
sanatorioRouter.post('/', sanitizesanatorioInput, add);
sanatorioRouter.put('/:id', sanitizesanatorioInput, update);
sanatorioRouter.patch('/:id', sanitizesanatorioInput, update);
sanatorioRouter.delete('/:id', remove);

 export default sanatorioRouter
