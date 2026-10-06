// Branch data. Sources: woodystakeout.app4food.co.uk delivery zones, Google Maps (phones, Monday hours) and Just Eat listings (weekly hours), read 5 Oct 2026,
// plus and the Food Standards Agency register (Yiewsley is 144 High Street per FSA and Google).
// hours: day index 0=Sun..6=Sat -> [open, close] in decimal hours (24 = midnight).
// delivery.zones: outward code or sector prefix -> fee, and the order value above which delivery is free / the minimum order.
window.BRANCHES = {
  aldershot: {
    name: "Aldershot", street: "182 Victoria Road", town: "Aldershot", region: "Hampshire", postcode: "GU11 1JZ",
    tel: "01252 333771", geo: [51.24863, -0.76607],
    hours: {0:[12,23],1:[11,23],2:[11,23],3:[11,23],4:[11,23],5:[11,24],6:[11,24]},
    hoursText: [["Mon to Thu","11am to 11pm"],["Fri and Sat","11am to midnight"],["Sun","12pm to 11pm"]],
    delivery: { zones: [
      {m:["GU11","GU12","GU9","GU10 1","GU10 3","GU10 4","GU10 5"], fee:3, freeOver:12},
      {m:["GU52"], fee:4, over12:1}
    ], areaText: "GU9, GU10 (1, 3, 4, 5), GU11, GU12 and GU52" }
  },
  farnborough: {
    name: "Farnborough", street: "218 Farnborough Road", town: "Farnborough", region: "Hampshire", postcode: "GU14 7JW",
    tel: "01252 524777", geo: [51.29280, -0.75304],
    hours: {0:[12,22.75],1:[11.5,22.75],2:[11.5,22.75],3:[11.5,22.75],4:[11.5,22.75],5:[11.5,23.75],6:[11.5,23.75]},
    hoursText: [["Mon to Thu","11.30am to 10.45pm"],["Fri and Sat","11.30am to 11.45pm"],["Sun","12pm to 10.45pm"]],
    delivery: { zones: [
      {m:["GU14","GU16"], fee:3, freeOver:12},
      {m:["GU15","GU51","GU17"], fee:1, min:12}
    ], areaText: "GU14, GU15, GU16, GU17 and GU51" }
  },
  yiewsley: {
    name: "Yiewsley", street: "144 High Street", town: "Yiewsley", region: "West Drayton", postcode: "UB7 7BD",
    tel: "01895 447121", geo: [51.51426, -0.47328],
    hours: {0:[12,23],1:[17,23],2:[17,23],3:[17,23],4:[17,23],5:[11,24],6:[11,24]},
    hoursText: [["Mon to Thu","5pm to 11pm"],["Fri and Sat","11am to midnight"],["Sun","12pm to 11pm"]],
    delivery: { zones: null, areaText: "Call the shop to check your street" }
  }
};
// Card payments go through a secure hosted checkout once connected. Nothing is charged from this page.
window.PAYMENT = { provider: "stripe-checkout", endpoint: "/api/create-checkout-session", live: false };
// Offers, matching what the current ordering site does. All values are set by the shop.
// reward: spend over `over` and claim one free item from category `cat` (mirrors "Free Item Available, Claim Now").
// promos: codes typed at checkout. tips: tip chips in pounds. cash: allow pay on collection/delivery.
// serviceCharge: the current site adds £1 to every order; this site does not.
window.OFFERS = {
  reward: { over: 15, cat: "Dips", label: "Free dip with orders over £15" },
  promos: { WELCOME10: { pct: 10, label: "10% off your first order" }, WOODYS2: { off: 2, min: 15, label: "£2 off orders over £15" } },
  tips: [0, 1, 2, 3],
  cash: true,
  serviceCharge: 0
};
