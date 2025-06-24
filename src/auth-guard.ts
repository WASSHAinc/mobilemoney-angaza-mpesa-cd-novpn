import { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
     /**
     * TODO: Add the necessary logic to authorize the API request.
     * this will also be used to handle encryption and decryption of the token.
     */

    // Implement your authentication logic here
    // For example, you could check for a token in the request headers
    return !!request.headers.authorization;
  }
}
