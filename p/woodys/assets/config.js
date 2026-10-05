// Branch data scraped from woodystakeout.app4food.co.uk/contact on 5 Oct 2026.
// hours: day index 0=Sun..6=Sat -> [open, close] in decimal hours (24 = midnight).
// delivery.outward: Aldershot list taken from the branch's Just Eat microsite (woodysburgers-aldershot.co.uk).
// GO-LIVE TODO: confirm every delivery area, delivery fee and minimum order with Woody's. null = not yet confirmed.
window.BRANCHES = {
  aldershot: {
    name: "Aldershot", street: "182 Victoria Road", town: "Aldershot", region: "Hampshire", postcode: "GU11 1JZ",
    tel: "01252 314360", geo: [51.24863, -0.76607],
    hours: {0:[12,23],1:[11,23],2:[11,23],3:[11,23],4:[11,23],5:[11,24],6:[11,24]},
    hoursText: [["Mon to Thu","11am to 11pm"],["Fri and Sat","11am to midnight"],["Sun","12pm to 11pm"]],
    delivery: { outward: ["GU3","GU9","GU10","GU11","GU12","GU14","GU16","GU17","GU51","GU52"], fee: null, min: null }
  },
  farnborough: {
    name: "Farnborough", street: "218 Farnborough Road", town: "Farnborough", region: "Hampshire", postcode: "GU14 7JW",
    tel: "01252 524777",
    hours: {0:[12,23],1:[11,23],2:[11,23],3:[11,23],4:[11,23],5:[11,24],6:[11,24]},
    hoursText: [["Mon to Thu","11am to 11pm"],["Fri and Sat","11am to midnight"],["Sun","12pm to 11pm"]],
    delivery: { outward: null, fee: null, min: null }
  },
  yiewsley: {
    name: "Yiewsley", street: "114 High Street", town: "Yiewsley", region: "Greater London", postcode: "UB7 7BD",
    tel: "01895 447121",
    hours: {0:[12,22.5],1:[17,22.5],2:[17,22.5],3:[17,22.5],4:[17,22.5],5:[11.5,23.5],6:[11.5,23.5]},
    hoursText: [["Mon to Thu","5pm to 10.30pm"],["Fri and Sat","11.30am to 11.30pm"],["Sun","12pm to 10.30pm"]],
    delivery: { outward: null, fee: null, min: null }
  }
};
// Payment: STUB ONLY. No keys. In production set this to your server endpoint that creates a Stripe Checkout Session.
window.PAYMENT = { provider: "stripe-checkout", endpoint: "/api/create-checkout-session", live: false };
