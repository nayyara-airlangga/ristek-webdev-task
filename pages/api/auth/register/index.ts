import { NextApiRequest, NextApiResponse } from "next"
import nookies from "nookies"

import { prisma } from "@config"
import { encryptText, createJWT, hashPassword } from "@utils"

const env = process.env.NODE_ENV

const encryptionKey = process.env.ENCRYPTION_KEY as string
const jwtSecret = process.env.JWT_SECRET as string

export const config = {
  api: {
    externalResolver: true,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      throw Error("Method not allowed")
    }

    const { username, email, name, password, rememberMe } = req.body

    const userWithUsername = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
      },
    })

    const userWithEmail = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
      },
    })

    if (userWithUsername || userWithEmail) {
      throw Error("User already exists")
    }

    const jwt = createJWT(
      { username, email, name },
      jwtSecret,
      rememberMe ? "30d" : "7d"
    )

    await prisma.user.create({
      data: {
        username,
        email,
        name,
        password: hashPassword(password),
      },
    })

    nookies.set({ res }, "jwt", encryptText(jwt, encryptionKey), {
      httpOnly: true,
      secure: env !== "development",
      path: "/",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    })

    res
      .status(200)
      .send({ status: "success", message: "Registration successful" })
  } catch (error: any) {
    res.status(error.message === "Method not allowed" ? 405 : 409).send({
      status: "error",
      message: error.message,
    })
  }
}

export default handler
