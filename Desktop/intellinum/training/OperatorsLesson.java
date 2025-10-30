public class OperatorsLesson {
    public static void main(String[] args) {
        int a = 10, b = 5;
        System.out.println("Addition: " + (a + b));
        System.out.println("Subtraction: " + (a - b));
        System.out.println("Multiplication: " + (a * b));
        System.out.println("Division: " + (a / b));
        System.out.println("Modulus: " + (a % b));

        // Relational operators
        System.out.println("a > b: " + (a > b));

        // Logical operators
        System.out.println("(a > b) && (b > 0): " + ((a > b) && (b > 0)));

        // Increment/decrement
        a++;
        b--;
        System.out.println("After ++ and -- : " + a + ", " + b);
    }
}
