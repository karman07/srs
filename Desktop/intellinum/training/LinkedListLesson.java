import java.util.LinkedList;

public class LinkedListLesson {
    public static void main(String[] args) {
        LinkedList<String> names = new LinkedList<>();
        names.add("A");
        names.add("B");
        names.addFirst("Start");
        names.addLast("End");

        for (String n : names) {
            System.out.println(n);
        }
    }
}
