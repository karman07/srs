public class MethodsLesson {
    public static void main(String[] args) {
        greet("Karman");
        int sum = add(5, 10);
        System.out.println("Sum: " + sum);
    }

    static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    static int add(int a, int b) {
        return a + b;
    }
}
