# Sunset Motors (test site)

A made-up dealership for testing DealerLoft's website import. Not a real business; the cars, VINs, phone number and photos are samples.

- `node build.mjs` rebuilds the site from the `CARS` list in build.mjs (needs C:\Users\777\dealer-post for sharp).
- To test updates: change a car's price or mileage, set `sold: true`, or remove a car; rebuild, commit, push.
- robots.txt lets only DealerLoftBot read the site; every page is noindex.
