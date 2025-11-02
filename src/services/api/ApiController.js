import AuthApiController from './controllers/AuthApiController';
import PlaceApiController from './controllers/PlaceApiController';

const ApiController = {
    ...AuthApiController,
    ...PlaceApiController,
}

export default ApiController;