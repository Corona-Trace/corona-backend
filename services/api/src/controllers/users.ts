import { Table } from "@google-cloud/bigtable/build/src/table";
import bunyan from "bunyan";
import { Request, Response } from "express";

export function mkUsers({ Users, log }: { Users: Table; log: bunyan }) {
  return (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
      res.status(400);
      res.end();
      return;
    }

    const updateBody: Record<string, any> = {};
    if (req.body.token) {
      updateBody.push_notification_token = { token: req.body.token };
    }

    if (req.body.severity !== undefined) {
      updateBody.status = {
        confirmed: String(req.body.severity === 1),
        informed_time: new Date().toISOString(),
      };
    }

    const row = Users.row(userId);
    // TODO: this does not overwrite values -- it appends
    row.save(updateBody, null, (err: Error | undefined) => {
      if (err) {
        log.error(err);
        res.status(500);
        res.end();
        return;
      }

      res.status(200);
      res.end("OK");
    });
  };
}