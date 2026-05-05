using Microsoft.ML.Data;

namespace CleanArchitecture.Core.Models.ML
{
    public class AirlineReviewData
    {
        [LoadColumn(6)] // Yorumun olduğu sütun
        public string ReviewText { get; set; }

        [LoadColumn(2)] // Puanın olduğu sütun
        public float RawRating { get; set; }
    }

    public class AirlineRatingPrediction
    {
        // 🚀 Regresyon modelleri "Score" döndürür, bu çok önemli!
        [ColumnName("Score")]
        public float Score { get; set; }
    }
}