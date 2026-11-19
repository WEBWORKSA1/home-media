/* Home.Media settings. Edit values here; no other file needs to change. */
window.HM_CONFIG = {
  /* Form inbox, stored encoded. It is decoded only at the moment a form is sent.
     Never replace this with plain text. */
  inbox: [68, 70, 74, 7, 69, 64, 72, 68, 78, 105, 24, 72, 90, 66, 91, 70, 94, 75, 76, 94],
  inboxKey: 41,
  formEndpoint: "https://formsubmit.co/ajax/",

  /* AdSense display-unit slot IDs. Leave blank until approved; Auto ads work without them. */
  adSlots: { "in-content": "", "sidebar": "", "home": "", "tool": "" },

  /* Payment links for the Support page. When blank, the page collects a pledge and you reply with a link. */
  donate: {
    paypal: "",        /* e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX */
    stripe: "",        /* e.g. https://buy.stripe.com/XXXX (one-time) */
    stripeMonthly: "", /* e.g. https://buy.stripe.com/YYYY (monthly) */
    bmc: ""            /* e.g. https://buymeacoffee.com/yourname */
  },

  /* Contest shown on contests.html and the home page. */
  contest: {
    name: "Setup of the Month",
    month: "January 2027",
    prize: "US$250 gift card for home-theater gear (winner's choice of retailer)",
    runnerUp: "Two runners-up: US$50 gift card + feature on the site",
    closes: "2027-01-31T23:59:00-05:00",
    sponsor: ""
  },

  /* UI switches */
  stickyCta: true,
  slideIn: true,
  cookieNotice: true
};
