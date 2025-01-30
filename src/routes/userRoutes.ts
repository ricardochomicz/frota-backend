import express from 'express';
import UserController from '../controllers/UserController';


const router = express.Router();

/**
 * @route GET /users
 * @description Retorna a lista de usuários cadastrados
 */
router.get('/users', UserController.getAll);

export default router;