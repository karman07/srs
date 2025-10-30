import java.util.HashSet;

public class HashSetLesson {
    public static void main(String[] args) {
        HashSet<Integer> numbers = new HashSet<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(10); // duplicate ignored

        for (int n : numbers) {
            System.out.println(n);
        }
    }
}
