namespace LibraryManagement.API.DTOs
{
    public class MonthlyReportDto
    {
        public string Newspaper { get; set; }
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Total { get; set; }
        public double Percentage { get; set; }
    }
}
