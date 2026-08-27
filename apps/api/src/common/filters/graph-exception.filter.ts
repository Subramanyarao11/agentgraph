import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import type { Response } from "express";
import { GraphConnectionError, GraphQueryError } from "@agentgraph/graph-client";

/**
 * Maps the two graph-layer error types to sensible HTTP responses instead of
 * letting them bubble up as opaque 500s: an unreachable database is a 503
 * (retryable, not the client's fault), a malformed/failed query is a 500
 * with the offending Cypher held server-side only (never echoed back).
 */
@Catch(GraphConnectionError, GraphQueryError)
export class GraphExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GraphExceptionFilter.name);

  catch(exception: GraphConnectionError | GraphQueryError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof GraphConnectionError) {
      this.logger.error(exception.message);
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: "Graph database unavailable",
        message: "The graph database could not be reached. Please try again shortly.",
      });
      return;
    }

    this.logger.error(exception.message, exception.cause instanceof Error ? exception.cause.stack : undefined);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Graph query failed",
      message: "Something went wrong running that query.",
    });
  }
}
