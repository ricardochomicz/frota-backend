import express from 'express';
import UserController from '../controllers/UserController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validate } from '../middlewares/Validate';
import { userSchema } from '../schemas/UserSchema';
import AuthController from '../controllers/auth/AuthController';


const router = express.Router();

/**
 * @route POST /users
 * @description Criação de um novo usuário
 */
router.post('/users', authMiddleware, validate(userSchema), UserController.create);

/**
 * @route GET /users
 * @description Retorna a lista de usuários cadastrados
 */
router.get('/users', authMiddleware, UserController.getAll);

/**
 * @route GET /users/:id
 * @description Retorna um usuário específico
 */
router.get('/user/:id', authMiddleware, UserController.get);

/**
 * @route PUT /users/:id
 * @description Atualiza um usuário específico
 */
router.put('/user/:id/edit', authMiddleware, validate(userSchema), UserController.update);


router.get('/me', authMiddleware, UserController.getAuthenticatedUser);

router.post('/logout', AuthController.logout);

export default router;