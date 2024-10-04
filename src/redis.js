import assert from "assert";
import { createClient } from "redis";

const client = createClient();
await client.connect();
const res1 = await client.hSet("bike:1", {
  model: "Deimos",
  brand: "Ergonom",
  type: "Enduro bikes",
  price: 4972,
});
console.log(res1); // 4

const res2 = await client.hGet("bike:1", "model");
console.log(res2); // 'Deimos'

const res3 = await client.hGet("bike:1", "price");
console.log(res3); // '4972'

const res4 = await client.hGetAll("bike:1");
console.log(res4);
/*
{
  brand: 'Ergonom',
  model: 'Deimos',
  price: '4972',
  type: 'Enduro bikes'
}
*/

const res5 = await client.hmGet("bike:1", ["model", "price"]);
console.log(res5); // ['Deimos', '4972']

const res6 = await client.hIncrBy("bike:1", "price", 100);
console.log(res6); // 5072
const res7 = await client.hIncrBy("bike:1", "price", -100);
console.log(res7); // 4972

const res11 = await client.hIncrBy("bike:1:stats", "rides", 1);
console.log(res11); // 1
const res12 = await client.hIncrBy("bike:1:stats", "rides", 1);
console.log(res12); // 2
const res13 = await client.hIncrBy("bike:1:stats", "rides", 1);
console.log(res13); // 3
const res14 = await client.hIncrBy("bike:1:stats", "crashes", 1);
console.log(res14); // 1
const res15 = await client.hIncrBy("bike:1:stats", "owners", 1);
console.log(res15); // 1
const res16 = await client.hGet("bike:1:stats", "rides");
console.log(res16); // 3
const res17 = await client.hmGet("bike:1:stats", ["crashes", "owners"]);
console.log(res17); // ['1', '1']
