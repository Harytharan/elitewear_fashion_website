//verfiy user 
import Jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const veryfyTocken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, "Unauthorized"));

  Jwt.verify(token, "this_is_secret", (err, user) => {
    if (err) return next(errorHandler(403, "Forbidden"));

    req.user = user;
    next();
  });
};
