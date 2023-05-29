import { Request, Response } from "express";
import mercadopage from "mercadopago";
import { HOST, MERCADOPAGO_API_KEY } from "../config";

export const createOrder = async (req: Request, res: Response) => {
  if (MERCADOPAGO_API_KEY) {
    mercadopage.configure({ access_token: MERCADOPAGO_API_KEY });
  }

  try {
    const order = await mercadopage.preferences.create({
      items: [
        {
          title: "Laptop",
          unit_price: 500,
          currency_id: "PEN",
          quantity: 1,
        },
      ],
      // Create an HTTP Tunnel for HTTPS connection. Otherwise mercadopago will throw an error.
      notification_url: "https://e720-190-237-16-208.sa.ngrok.io/webhook",
      back_urls: {
        success: `${HOST}/success`,
        // pending: `${HOST}/pending`,
        // failure: `${HOST}/failure`,
      },
    });

    res.json(order.body);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payment = req.query;

    if (payment.type === "payment") {
      const data = await mercadopage.payment.findById(Number(payment["data.id"]));
      console.log(data);
    }

    res.sendStatus(204);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
