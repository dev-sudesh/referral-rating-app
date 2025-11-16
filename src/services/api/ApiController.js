import AuthApiController from './controllers/AuthApiController';
import PlaceApiController from './controllers/PlaceApiController';
import UserApiController from './controllers/UserApiController';
import ReferralApiController from './controllers/ReferralApiController';

const ApiController = {
    ...AuthApiController,
    ...PlaceApiController,
    ...UserApiController,
    ...ReferralApiController,
}

export default ApiController;