import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding R Programming content...\n");

  // Delete existing data
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.topic.deleteMany();

  // Create R Programming Topic
  const rTopic = await prisma.topic.create({
    data: {
      slug: "r-programming",
      title: "R Programming Tutorial",
      description: "Learn R programming from scratch - beginner friendly",
      icon: "BarChart3",
      order: 2,
      published: true,
    },
  });

  // create home page
  await prisma.lesson.create({
    data: {
      slug: "home",
      title: "R Home",
      description: "Welcome to R Programming Tutorial",
      content:
        "## Introduction to R Programming\r\n\r\nR is a powerful programming language designed specifically for statistics, data analysis, and creating beautiful visualizations. Think of it as a Swiss Army knife for anyone working with data - from students analyzing survey results to scientists crunching research numbers.\r\n\r\n## Why Learn R?\r\n\r\nR makes complex data tasks surprisingly simple. Instead of spending hours in spreadsheets, you can analyze thousands of data points with just a few lines of code. Plus, it's completely free and has a massive community creating helpful tools called \"packages\" that extend what R can do.\r\n\r\n## What Can You Do With R?\r\n\r\n**Data Analysis**: Calculate averages, find patterns, and run statistical tests effortlessly.\r\n\r\n**Data Visualization**: Create professional charts, graphs, and plots that make your data tell a story.\r\n\r\n**Machine Learning**: Build models that can predict trends and make data-driven decisions.\r\n\r\n**Report Generation**: Automatically create reports with your analysis results embedded right in.\r\n\r\n## R vs Other Languages\r\n\r\nUnlike general programming languages like Python or JavaScript, R was built from the ground up for statistics. This means tasks that might take 20 lines in another language often take just 2-3 lines in R. It's like using a calculator designed specifically for the math you need to do.\r\n\r\n## Getting Started is Easy\r\n\r\nR uses simple, readable syntax that feels like writing English sentences. For example, to calculate the average of numbers, you simply write:\r\n\r\n`mean(c(10, 20, 30, 40, 50))`\r\n\r\nThat's it! No complex setup or confusing syntax - just straightforward commands that do exactly what they say.\r\n\r\n## Who Uses R?\r\n\r\n- **Data Scientists** at companies like Google, Facebook, and Netflix\r\n- **Researchers** at universities analyzing experiments\r\n- **Financial Analysts** predicting market trends\r\n- **Healthcare Professionals** studying patient data\r\n- **Students** learning statistics and data science\r\n\r\nReady to start your R journey? In the next lessons, you'll install R and write your first program!\r\n\r\n\r\nBy the end of this tutorial, you'll be able to:\r\n- Analyze any dataset with confidence\r\n- Create professional visualizations\r\n- Clean and transform messy data\r\n- Perform statistical analysis\r\n- Build your first data science portfolio",
      order: 1,
      duration: 5,
      published: true,
      topicId: rTopic.id,
    },
  });

  console.log("✅ Created R Programming topic");

  // Create Introduction Section with lessons
  await prisma.section.create({
    data: {
      slug: "installation",
      title: "Installation",
      description: "Step by Step guide for installing R and RStudio",
      order: 2,
      published: true,
      topicId: rTopic.id,
      lessons: {
        create: [
          {
            topicId: rTopic.id,
            slug: "how-to-install-r-on-windows",
            title: "How to install R on Windows",
            description:
              "Learn how to install R on your Windows system step by step guide for installtion of R.",
            content: `
## How to Install R and RStudio on Windows

This guide will walk you through the two essential parts of setting up your R environment on a Windows computer.

> ⚠️ **Important:** You **must** install R **before** you install RStudio.
>
> R is the programming language (the "engine"), and RStudio is the user-friendly interface (the "dashboard"). The dashboard won't work without the engine.

---

### Part 1: Install R (The Engine)

First, we will install the core R language.

1\.  **Go to the CRAN Website:**
    Navigate to the official R download page:\n
    [https://cran.r-project.org/bin/windows/base/](https://cran.r-project.org/bin/windows/base/)

2\.  **Download R for Windows:**
    Click the large link at the top of the page that says **"DOWNLOAD AND INSTALL R"**.
    <img
      src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761056553/r_instllation_page_ezrbqt.png"
      alt="R installation page image"
    />

3\.  **Run the Installer:**
    Once the \`.exe\` file has finished downloading, open it to start the installation.

4\.  **Accept All Defaults:**
    This is the easiest and most reliable method. Click **"OK"**, then **"Next"** through all the installation steps.
    - Select your language (default is English)
    - Accept license
    - Keep default paths
    - Continue clicking Next

5\.  **Finish Installation:**
    Click **"Finish"**. You have successfully installed R!

---

### Part 2: Install RStudio (The Dashboard)

Now that R is installed, let’s install RStudio.

1\.  **Go to the Posit Website:**
    [https://posit.co/download/rstudio-desktop/](https://posit.co/download/rstudio-desktop/)

2\.  **Download RStudio Desktop:**
    Click the Windows download button for **RStudio Desktop (Free)**.

    <img
      src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761060752/r_s_2_uqonoh.png"
      alt="R Studio installation page image"
    />

3\.  **Run the Installer:**
    Once downloaded, open the \`.exe\` file and install with defaults.

4\.  **Finish Installation:**
    Click **"Finish"** when done.

---

### Part 3: Check Your Installation

1\.  **Open RStudio:**
    Open it from the Start Menu (not the plain R app).

2\.  **Test Installation:**
    In the **Console**, type:

    \`\`\`r
    1 + 1
    \`\`\`

    <img
      src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761057156/rstudio_console_image_ynn3cl.png"
      alt="RStudio console test"
    />

If it prints \`[1] 2\`, 🎉 you’re all set!
`,
            order: 1,
            duration: 5,
            published: true,
          },
        ],
      },
    },
  });

  // Create Getting Started Section with lessons
  await prisma.lesson.create({
    data: {
      slug: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of R programming language.",
      order: 3,
      published: true,
      topicId: rTopic.id,
      content: `## Getting Started with R

This section introduces you to the essential concepts of the R programming language. By the end, you’ll understand how to write simple R code, manage data, and create basic visualizations (all topics we will cover in depth in the next sections).

---

### Basic R Syntax

R is an interpreted language, so you can type commands in the Console and see results instantly. You write expressions, assign values to variables, and call functions to perform tasks, with clear feedback in real time.

A simple R command looks like this:

\`\`\`
x <- 10
y <- 5
result <- x + y
print(result)
\`\`\`

Output :

\`\`\`
[1] 15
\`\`\`

In this example, \`<-\` is the assignment operator used to store values in variables, and \`print()\` displays output in the Console. You can also use \`=\` for assignment, but the arrow is widely preferred in R style.

R supports several basic data types:
- Numeric: whole or decimal numbers (e.g., 42, 3.14)
- Character: text in quotes (e.g., "Hello")
- Logical: \`TRUE\` or \`FALSE\`

You can perform arithmetic directly in the Console:
\`\`\`
10 * 3
20 / 4
\`\`\`

Output :

\`\`\`
[1] 30
[1] 5
\`\`\`

---

### Data Structures in R

R provides multiple ways to organize and manage data efficiently. These structures help you model vectors of values, tables of columns, and even higher-dimensional data.

1. Vectors (one type only)
\`\`\`
numbers <- c(1, 2, 3, 4, 5)
\`\`\`

2. Lists (mixed types)
\`\`\`
info <- list(name = "Alice", age = 25, scores = c(80, 90, 85))
\`\`\`

3. Matrices (2D, one type)
\`\`\`
matrix_data <- matrix(1:6, nrow = 2, ncol = 3)
\`\`\`

4. Data Frames (tabular, column types may differ)
\`\`\`
students <- data.frame(
  name = c("Alice", "Bob"),
  age = c(22, 24),
  grade = c("A", "B")
)
\`\`\`

5. Arrays (2D+)
\`\`\`
array_data <- array(1:12, dim = c(2, 3, 2))
\`\`\`

---

### Control Flow

Control flow structures help you choose what to do and how many times to do it. Use conditionals to branch behavior, and loops to repeat actions over sequences or while conditions hold.

Conditional statements:
\`\`\`
x <- 10

if (x > 5) {
  print("x is greater than 5")
} else {
  print("x is 5 or less")
}
\`\`\`

Output :

\`\`\`
[1] "x is greater than 5"
\`\`\`

Loops:

For loop:
\`\`\`
for (i in 1:5) {
  print(i)
}
\`\`\`

Output :

\`\`\`
[1] 1
[1] 2
[1] 3
[1] 4
[1] 5
\`\`\`

While loop:
\`\`\`
count <- 1
while (count <= 5) {
  print(count)
  count <- count + 1
}
\`\`\`

Output :

\`\`\`
[1] 1
[1] 2
[1] 3
[1] 4
[1] 5
\`\`\`

---

### Functions

Functions package reusable logic so your code is cleaner, testable, and easier to maintain. Define parameters, compute results, and return values to the caller.

A simple function example:
\`\`\`
add_numbers <- function(a, b) {
  return(a + b)
}

result <- add_numbers(5, 3)
print(result)
\`\`\`

Output :

\`\`\`
[1] 8
\`\`\`

Functions in R start with the keyword \`function\`, \`return()\` sends back a result, and you can also use many built-in functions like \`sum()\`, \`mean()\`, and \`length()\`.

---

### Importing and Exploring Data

R can easily load external files (CSV, Excel) and provides quick tools to inspect structure and summary statistics. This step ensures you understand your dataset before analysis.

Importing a CSV file:
\`\`\`
data <- read.csv("data.csv")
head(data)
\`\`\`

Viewing and summarizing data:
\`\`\`
summary(data)
str(data)
\`\`\`

- \`head()\` shows the first rows
- \`summary()\` gives descriptive stats
- \`str()\` shows structure and column types

---

### Data Visualization

Data visualization helps reveal patterns and trends, turning raw numbers into insights. Base R plotting is quick and built-in; you can later explore \`ggplot2\` for more customization.

Basic plots in R:

Scatter plot:
\`\`\`
x <- 1:10
y <- x^2
plot(x, y, main = "Scatter Plot", xlab = "X Values", ylab = "Y Values")
\`\`\`

<img src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761063328/scatter_plot_ggoghy.png" alt="r studio scatter plot image"/>

Bar plot:
\`\`\`
heights <- c(150, 160, 170, 180)
names(heights) <- c("A", "B", "C", "D")
barplot(heights, main = "Height Comparison", col = "lightblue")
\`\`\`

<img src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761064173/bar_plot_troui3.png" alt="r studio bar plot image"/>

Line chart:
\`\`\`
plot(x, y, type = "l", main = "Line Chart", xlab = "X", ylab = "Y")
\`\`\`

<img src="https://res.cloudinary.com/dlxuo8zhg/image/upload/v1761063868/line_chart_ctz0uv.png" alt="r studio line chart image"/>

---

### Summary

In this guide, you learned how to:
- Write and execute basic R code
- Use the main data structures in R
- Apply loops and conditional statements
- Define and call your own functions
- Load, explore, and visualize data

dont wory if you dont understand everything. this just a introduction to R how is being used in data analysis we will cover more in depth in the next sections. 
`,
    },
  });

  console.log("✅ Created Introduction section with 5 lessons");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
