// import request from "supertest";
// import app from "../../src/app";

// describe("POST /auth/register", () => {

//     it("should register user", async () => {

//         const res = await request(app)
//             .post("/auth/register")
//             .send({
//                 name: "Erfan",
//                 email: "erfan@test.com",
//                 phone: "09123456789",
//                 password: "12345678"
//             });

//         expect(res.status).toBe(201);

//         expect(res.body.data.email)
//             .toBe("erfan@test.com");

//     });

// });