import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { Observable } from "rxjs";
import { RequestContext } from "../request-context";
import { ObservabilityService } from "../../observability/observability.service";

/**
 * Times every HTTP request and tags it with a correlation ID (returned as
 * `x-request-id`, echoing a caller-supplied one if present). The ID is also
 * threaded through AsyncLocalStorage for the request's lifetime so Cypher
 * queries GraphService runs while handling it get attributed back to it.
 *
 * `next.handle()` builds a lazy Observable — Nest doesn't actually subscribe
 * it (which is what invokes the route handler) until after every
 * interceptor's `intercept()` has returned. Wrapping only the `next.handle()`
 * call in `RequestContext.run(...)` would therefore exit the AsyncLocalStorage
 * context before the handler ever runs. Instead we build a new Observable
 * whose subscription — including the inner `next.handle().subscribe(...)`
 * that triggers the handler — happens inside `run(...)`.
 */
@Injectable()
export class RequestTracingInterceptor implements NestInterceptor {
  constructor(private readonly observability: ObservabilityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const requestId = (request.headers["x-request-id"] as string | undefined) || randomUUID();
    response.setHeader("x-request-id", requestId);

    const method = request.method;
    const route = request.route?.path ? `${request.baseUrl}${request.route.path}` : request.path;
    const start = performance.now();

    // `finish` fires once Node has flushed the response — after Nest's
    // global exception filter (GraphExceptionFilter) has had a chance to set
    // the real status code, unlike reading response.statusCode from this
    // Observable's own error/complete callbacks (which happens too early on
    // the error path, before the filter runs).
    response.once("finish", () => {
      this.observability.recordRequest({
        id: requestId,
        method,
        route,
        statusCode: response.statusCode,
        durationMs: performance.now() - start,
      });
    });

    return new Observable((subscriber) => {
      RequestContext.run(requestId, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
