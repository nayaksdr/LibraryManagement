namespace LibraryManagement.API.Services
{
    public interface ITransactionService
    {
        Task<string> IssueBook(int bookId, int userId);
        Task<string> ReturnBook(int transactionId);
    }
}
