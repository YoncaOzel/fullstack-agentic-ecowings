using CleanArchitecture.Core.Interfaces;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using BERTTokenizers; // Install via NuGet
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Services
{
    public class MLService : IMLService
    {
        private readonly InferenceSession _session;
        private readonly BertUncasedBaseTokenizer _tokenizer;
        // The new model format exported from Python
        private readonly string _modelPath = Path.Combine(AppContext.BaseDirectory, "model.onnx");

        public MLService()
        {
            if (System.IO.File.Exists(_modelPath))
            {
                var fileInfo = new System.IO.FileInfo(_modelPath);
                Console.WriteLine($"\n===============================================");
                Console.WriteLine($"[SİSTEM KONTROLÜ] OKUNAN MODEL YOLU: {fileInfo.FullName}");
                Console.WriteLine($"[SİSTEM KONTROLÜ] MODEL BOYUTU: {fileInfo.Length / (1024 * 1024)} MB");
                Console.WriteLine($"===============================================\n");
            }
            else
            {
                Console.WriteLine($"\n[HATA] DİKKAT! Model bulunamadı: {_modelPath}\n");
            }

            _session = new InferenceSession(_modelPath);
            _tokenizer = new BertUncasedBaseTokenizer();
        }

        public Task<int> PredictRatingAsync(string comment)
        {
            var allTokens = _tokenizer.Encode(512, comment);
            var validTokens = allTokens.Where(t => t.InputIds != 0).ToList();

            // ÇÖZÜM BURADA: Kütüphanenin -1 okuma hatasını manuel olarak tersine çeviriyoruz!
            var inputIdsArray = validTokens.Select(t =>
            {
                long id = (long)t.InputIds;
                // 0 ile 102 arasındaki ID'ler sistemin yapıtaşlarıdır ([PAD], [UNK], [CLS]=101, [SEP]=102).
                // Onlara kesinlikle DOKUNMUYORUZ. Sadece gerçek kelimelere (id > 102) +1 ekliyoruz.
                return (id > 102) ? id + 1 : id;
            }).ToArray();

            var attentionMaskArray = Enumerable.Repeat(1L, validTokens.Count).ToArray();
            var tokenTypeIdsArray = Enumerable.Repeat(0L, validTokens.Count).ToArray();

            Console.WriteLine($"\n--- YORUM: '{comment}' ---");
            Console.WriteLine("DÜZELTİLMİŞ TOKEN IDS: " + string.Join(", ", inputIdsArray));

            var inputIds = new DenseTensor<long>(inputIdsArray, new[] { 1, validTokens.Count });
            var attentionMask = new DenseTensor<long>(attentionMaskArray, new[] { 1, validTokens.Count });
            var tokenTypeIds = new DenseTensor<long>(tokenTypeIdsArray, new[] { 1, validTokens.Count });

            var inputs = new List<NamedOnnxValue>
    {
        NamedOnnxValue.CreateFromTensor("input_ids", inputIds),
        NamedOnnxValue.CreateFromTensor("attention_mask", attentionMask),
        NamedOnnxValue.CreateFromTensor("token_type_ids", tokenTypeIds)
    };

            using var results = _session.Run(inputs);

            var outputNode = results.FirstOrDefault(x => x.Name == "logits") ?? results.First();
            var outputTensor = outputNode.AsTensor<float>();
            float[] logits = outputTensor.ToArray();

            Console.WriteLine("LOGITS (Olasılıklar): " + string.Join(", ", logits));

            int maxIndex = 0;
            float maxValue = logits[0];

            for (int i = 1; i < logits.Length; i++)
            {
                if (logits[i] > maxValue)
                {
                    maxValue = logits[i];
                    maxIndex = i;
                }
            }

            int predictedBaseStars = maxIndex + 1;
            Console.WriteLine("TAHMİN EDİLEN YILDIZ (1-5): " + predictedBaseStars);
            Console.WriteLine("---------------------------\n");

            int finalRating = predictedBaseStars * 2;
            return Task.FromResult(finalRating);
        }

        public Task TrainModelAsync(string csvPath)
        {
            // Training deep NLP models dynamically in C# during runtime is highly inefficient.
            // This is now stubbed out. Training is handled externally via Python.
            throw new NotSupportedException("Model training is now handled externally via Python.");
        }
    }
}