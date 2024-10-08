### README for Vote Record Management API

#### Overview

This API is designed to manage voting records for an online voting system. It handles casting votes, retrieving vote records, and managing poll data. The API is built using Node.js and Express, with MongoDB as the database.

---

#### Features

1. **Cast a Vote**
   - Endpoint: `/api/v1/voteRecord/create`
   - Method: `POST`
   - Description: Records a vote for a specific poll and option, ensuring that no duplicate votes are cast by the same user.
   - Authentication: Protected by user authentication.
   - Request Body:
     ```json
     {
       "pollId": "ObjectId of the Poll",
       "optionId": "ObjectId of the Option"
     }
     ```
   - Response: Returns the recorded vote, updated poll total votes, and vote percentages for all options in the poll.

2. **Get All Vote Records**
   - Endpoint: `/api/v1/voteRecord/getall`
   - Method: `GET`
   - Description: Retrieves all vote records.
   - Authentication: Protected by user authentication.
   - Response: Returns a list of all vote records.

3. **Get Vote Record by ID**
   - Endpoint: `/api/v1/voteRecord/getone/:id`
   - Method: `GET`
   - Description: Retrieves a specific vote record by its ID, including detailed information about the poll and the user who voted.
   - Authentication:  Protected by user authentication.
   - Response: Returns the vote record with flattened data for easier consumption.

4. **Delete Vote Record**
   - Endpoint: `/api/v1/voteRecord/delete/:id`
   - Method: `DELETE`
   - Description: Deletes a vote record by its ID.
   - Authentication: Protected by user authentication.
   - Response: Confirms the deletion of the vote record.

---

#### Models

1. **VoteRecord**
   - `pollId`: References the Poll model.
   - `userId`: References the User model.
   - `optionId`: References the Option model.
   - `ipAddress`: Stores the IP address of the user.
   - `votedAt`: Stores the timestamp of when the vote was cast.

2. **Poll**
   - `title`: The title of the poll.
   - `creator`: References the User who created the poll.
   - `options`: Array of options available in the poll.
   - `totalVotes`: The total number of votes cast in the poll.

3. **Option**
   - `option`: The text of the option.
   - `votes`: The number of votes received by the option.

---

#### Middleware

- **protect**: Middleware function that ensures only authenticated users can access certain routes.

---

#### Error Handling

- **AppError**: Custom error handler that standardizes error responses.
- **catchAsync**: Utility function to handle asynchronous errors in route handlers.

---

#### Installation and Setup

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file and set up your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`).
4. Run the server using `npm start`.

---

#### Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

---

#### License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

#### Contact

For issues, questions, or contributions, please reach out at `email@example.com`.

---

This README provides a comprehensive guide to understanding and using the Vote Record Management API.