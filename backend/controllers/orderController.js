router.post("/create-intent", async (req, res) => {
  const { productId, quantity, amount } = req.body;

  const order = await Order.create({
    userId: req.user.id,
    productId,
    quantity,
    amount,
    status: "pending",
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    metadata: {
      orderId: order._id.toString(),
    },
  });

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});

export default router;