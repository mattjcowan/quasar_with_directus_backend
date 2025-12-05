import type { Request, Response } from 'express';

// GET /api/users/:id
export const GET = (req: Request, res: Response) => {
  const { id } = req.params;

  // Example: fetch user from database
  res.json({
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`
  });
};

// PUT /api/users/:id
export const PUT = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  // Example: update user in database
  res.json({
    id,
    name,
    email,
    updated: true
  });
};

// DELETE /api/users/:id
export const DELETE = (req: Request, res: Response) => {
  const { id } = req.params;

  // Example: delete user from database
  res.json({
    id,
    deleted: true
  });
};
