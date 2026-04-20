using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
var app = builder.Build();


app.UseDefaultFiles(); 
app.UseStaticFiles(); 
using (var db = new AppDbContext())
{
    db.Database.EnsureCreated();
}

app.MapPost("/addAuthors", async (Author author) =>
{
    using var db = new AppDbContext();
    db.Authors.Add(author);
    await db.SaveChangesAsync();
    return "Автор добавлен";
});

app.MapPost("/addBooks", async (Book book) =>
{
    using var db = new AppDbContext();
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return "книга добавлена";
});

// Получить книги с авторами (через Include)
app.MapGet("/getBooksList", async () =>
{
    using var db = new AppDbContext();
    var books = await db.Books.Include(b => b.Author).ToListAsync();
    return Results.Json(books);
});
app.MapGet("/getAmountOfAuthors", async () =>
{
    using var db = new AppDbContext();
    int AmountOfAuthors = await db.Authors.CountAsync();
    int AmountOfBooks = await db.Books.CountAsync();
    Console.WriteLine($"Количество авторов: {AmountOfAuthors}, количество книг: {AmountOfBooks}");
    return AmountOfAuthors;

});
app.MapGet("/getAuthorList", async () =>
{
    using var db = new AppDbContext();
    var authors = await db.Authors.Include(b => b.Books).ToListAsync();
    return Results.Json(authors);
});
app.MapGet("/authorIsExists", (int id) =>
{
    Console.WriteLine(id);
    var db = new AppDbContext();
    bool exists = db.Authors.Any(a => a.Id == id);
    Console.WriteLine(exists);
    return exists;
});
app.MapPost("/deleteBook", async (IdRequest BookId) =>
{
    using var db = new AppDbContext();
    var book = await db.Books.FirstOrDefaultAsync(book => book.Id == BookId.Request);
    if(book != null)
    {
        db.Books.Remove(book);
        db.SaveChangesAsync();
    }
    return $"Книга под индексом {book.Id} была удалена";

});
app.MapPost("/editBook", async (EditRequest BookRequest) =>
{
    using var db = new AppDbContext();
    var book = await db.Books.FirstOrDefaultAsync(book => book.Id == BookRequest.Id);
    Console.WriteLine(book.Title);
    book.Title = BookRequest.NewName;
    db.SaveChangesAsync();
    Console.WriteLine(book.Title);
    return $"Пользователь поменял название книги под ID {book.Id} на {book.Title}";
});
app.MapPost("/getAuthorListById", async (IdRequest AuthorRequest) =>
{
    using var db = new AppDbContext();
    var authors = await db.Authors.Where(a => a.Id == AuthorRequest.Request).ToListAsync();
    return Results.Json(authors);
});

app.Run();
public class IdRequest
{
    public int Request {get; set;}
}
public class EditRequest
{
    public string NewName {get; set;}
    public int Id {get; set;}
}
public class Author
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Book> Books { get; set; } = new();
}
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public Author Author { get; set; } = null!;
}


public class AppDbContext : DbContext
{
    public DbSet<Author> Authors { get; set; }
    public DbSet<Book> Books { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=authorsbooks.db");
}