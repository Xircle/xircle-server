import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import HttpException from './HttpException';
 

function validationMiddleware(type: any): express.RequestHandler {
    return (req, res, next) => {
        
      validate(plainToClass(type, req.body))
        .then((errors: ValidationError[]) => {
          if (errors.length > 0) {
            const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(' ,and ');
            next(new HttpException(400, message));
          } else {
            next();
          }
        });
    };
  }

function validationDataMiddleware(type: any): express.RequestHandler {
  return (req, res, next) => {
    
    //req.body.data=JSON.parse(req.body.data);

    validate(plainToClass(type, req.body.data))
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(' ,and ');
          next(new HttpException(400, message));
        } else {
          next();
        }
      });
  };
}

function validationQueryMiddleware(type: any): express.RequestHandler {
    return (req, res, next) => {


        validate(plainToClass(type, req.query))
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(' ,and ');
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            });
    };
}

function validationParamsMiddleware(type: any): express.RequestHandler {
    return (req, res, next) => {


        validate(plainToClass(type, req.params))
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(' ,and ');
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            });
    };
}




export {validationMiddleware,validationDataMiddleware,validationQueryMiddleware,validationParamsMiddleware};